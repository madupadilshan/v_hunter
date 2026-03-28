#!/usr/bin/env python3
"""
V HUNTER Backend Server
AI-Driven Universal Vulnerability Scanner Backend

This is a minimal example Flask server with Socket.io support.
Extend this with your actual vulnerability scanning logic.

Usage:
  python backend.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
import random
import threading
import time
import os

# ============================================================================
# CONFIGURATION
# ============================================================================

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "*"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Socket.io configuration
socketio = SocketIO(app, cors_allowed_origins="*")

# ============================================================================
# MOCK DATA & THREAT DATABASE
# ============================================================================

MOCK_VULNERABILITIES = {
    'apk': [
        {
            'id': 1,
            'name': 'Remote Code Execution',
            'severity': 'Critical',
            'description': 'The application contains an RCE vulnerability due to unsanitized user input.',
            'cvss': 9.8,
            'cwe': 'CWE-94',
            'solution': 'Implement proper input validation and sanitization'
        },
        {
            'id': 2,
            'name': 'SQL Injection',
            'severity': 'Critical',
            'description': 'SQL injection vulnerability in database queries.',
            'cvss': 9.6,
            'cwe': 'CWE-89',
            'solution': 'Use parameterized queries'
        },
        {
            'id': 3,
            'name': 'Insecure Data Storage',
            'severity': 'High',
            'description': 'Sensitive data stored in plaintext.',
            'cvss': 7.5,
            'cwe': 'CWE-922',
            'solution': 'Encrypt sensitive data at rest'
        },
    ],
    'url': [
        {
            'id': 1,
            'name': 'Known Malicious IP',
            'severity': 'Critical',
            'description': 'This IP is known for malicious activity.',
            'cvss': 9.9,
            'cwe': 'N/A',
            'solution': 'Block this IP address'
        },
        {
            'id': 2,
            'name': 'Outdated TLS',
            'severity': 'High',
            'description': 'Server uses outdated TLS version.',
            'cvss': 7.2,
            'cwe': 'CWE-327',
            'solution': 'Upgrade to TLS 1.3'
        },
    ]
}

THREAT_LOCATIONS = [
    {'lat': 39.9042, 'lng': 116.4074, 'country': 'China'},
    {'lat': 55.7558, 'lng': 37.6173, 'country': 'Russia'},
    {'lat': 34.0522, 'lng': -118.2437, 'country': 'USA'},
    {'lat': 35.6892, 'lng': 139.6917, 'country': 'Japan'},
    {'lat': 51.5074, 'lng': -0.1278, 'country': 'UK'},
    {'lat': 48.8566, 'lng': 2.3522, 'country': 'France'},
    {'lat': 40.7128, 'lng': -74.006, 'country': 'USA'},
    {'lat': -33.8688, 'lng': 151.2093, 'country': 'Australia'},
]

# ============================================================================
# SOCKET.IO EVENTS
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'[OK] Client connected: {request.sid}')
    emit('response', {
        'status': 'connected',
        'message': 'Connected to V HUNTER Backend',
        'timestamp': datetime.now().isoformat()
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'[INFO] Client disconnected: {request.sid}')

@socketio.on('request_threat_data')
def send_threat_data(data=None):
    """Send historical threat data to client"""
    print('[INFO] Client requested threat data')

    # Generate mock threat data
    threats = []
    for _ in range(5):
        source = random.choice(THREAT_LOCATIONS)
        target = random.choice(THREAT_LOCATIONS)
        while source == target:
            target = random.choice(THREAT_LOCATIONS)

        threat = {
            'startLat': source['lat'],
            'startLng': source['lng'],
            'endLat': target['lat'],
            'endLng': target['lng'],
            'sourceCountry': source['country'],
            'targetCountry': target['country'],
            'threatType': random.choice(['DDoS Attack', 'Malware', 'Phishing', 'APT']),
            'color': 'rgba(255, 0, 85, 0.8)'
        }
        threats.append(threat)

    emit('threat_data', threats)

# ============================================================================
# REST API ENDPOINTS
# ============================================================================

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        'name': 'V HUNTER Backend',
        'version': '1.0.0',
        'status': 'online',
        'documentation': '/api/docs'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'socket_io': 'enabled',
        'uptime_seconds': int(time.time())
    }), 200

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """
    Handle file upload and scanning.

    Parameters:
        files: List of files to scan

    Returns:
        List of vulnerabilities found
    """
    print('[INFO] File upload received')

    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    files = request.files.getlist('files')
    if not files or len(files) == 0:
        return jsonify({'error': 'No files selected'}), 400

    all_vulnerabilities = []

    for file in files:
        if file and file.filename:
            filename = file.filename
            # Determine file type
            file_type = 'unknown'
            if filename.endswith(('.apk', '.exe')):
                file_type = 'apk'

            # Get vulnerabilities for this file type
            vulnerabilities = MOCK_VULNERABILITIES.get(file_type, [])

            # Add random CVSS variation
            for vuln in vulnerabilities:
                vuln_copy = vuln.copy()
                vuln_copy['cvss'] += random.uniform(-0.5, 0.5)
                all_vulnerabilities.append(vuln_copy)

    return jsonify({
        'status': 'success',
        'vulnerabilities': all_vulnerabilities,
        'total_found': len(all_vulnerabilities),
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/scan', methods=['POST'])
def scan_target():
    """
    Handle URL/IP scanning.

    Parameters:
        target: URL or IP address to scan

    Returns:
        Vulnerabilities and threat intelligence
    """
    data = request.get_json()
    target = data.get('target') if data else None

    if not target:
        return jsonify({'error': 'No target provided'}), 400

    print(f'[INFO] Scan requested for: {target}')

    # Get vulnerabilities
    vulnerabilities = MOCK_VULNERABILITIES.get('url', [])

    # Create threat intelligence
    threat_intel = {
        'target': target,
        'reputation_score': random.uniform(1.0, 10.0),
        'threat_level': random.choice(['Critical', 'High', 'Medium', 'Low']),
        'last_seen': (datetime.now() - timedelta(hours=random.randint(1, 72))).isoformat(),
        'incidents': random.randint(1, 100),
        'geographic_origin': random.sample([loc['country'] for loc in THREAT_LOCATIONS], k=2)
    }

    return jsonify({
        'status': 'success',
        'target': target,
        'vulnerabilities': vulnerabilities,
        'threat_intel': threat_intel,
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/vulnerabilities', methods=['GET'])
def get_vulnerabilities():
    """Get all known vulnerabilities"""
    all_vulns = []
    all_vulns.extend(MOCK_VULNERABILITIES.get('apk', []))
    all_vulns.extend(MOCK_VULNERABILITIES.get('url', []))

    return jsonify({
        'status': 'success',
        'vulnerabilities': all_vulns,
        'count': len(all_vulns)
    }), 200

@app.route('/api/vulnerabilities/<int:vuln_id>', methods=['GET'])
def get_vulnerability(vuln_id):
    """Get specific vulnerability details"""
    for vuln_list in MOCK_VULNERABILITIES.values():
        for vuln in vuln_list:
            if vuln['id'] == vuln_id:
                return jsonify({
                    'status': 'success',
                    'vulnerability': vuln
                }), 200

    return jsonify({'error': 'Vulnerability not found'}), 404

@app.route('/api/threats/top', methods=['GET'])
def get_top_threats():
    """Get top threats by country"""
    limit = request.args.get('limit', 10, type=int)

    threats = [
        {'country': 'China', 'ips': 2841, 'percentage': 28},
        {'country': 'Russia', 'ips': 2103, 'percentage': 21},
        {'country': 'North Korea', 'ips': 1567, 'percentage': 16},
        {'country': 'Iran', 'ips': 987, 'percentage': 10},
        {'country': 'Unknown', 'ips': 2502, 'percentage': 25},
    ]

    return jsonify({
        'status': 'success',
        'threats': threats[:limit],
        'total': sum(t['ips'] for t in threats),
        'timestamp': datetime.now().isoformat()
    }), 200

# ============================================================================
# BACKGROUND TASKS
# ============================================================================

def emit_random_threats():
    """
    Background task that emits random threats periodically.
    This simulates real-time attack data coming in.
    """
    with app.app_context():
        while True:
            try:
                time.sleep(5)  # Emit a threat every 5 seconds

                source = random.choice(THREAT_LOCATIONS)
                target = random.choice(THREAT_LOCATIONS)
                while source == target:
                    target = random.choice(THREAT_LOCATIONS)

                threat = {
                    'startLat': source['lat'],
                    'startLng': source['lng'],
                    'endLat': target['lat'],
                    'endLng': target['lng'],
                    'sourceCountry': source['country'],
                    'targetCountry': target['country'],
                    'threatType': random.choice(['DDoS', 'Malware', 'Phishing', 'APT', 'Ransomware']),
                    'color': 'rgba(255, 0, 85, 0.8)'
                }

                socketio.emit('new_threat', threat, broadcast=True)
                print(f'[INFO] Threat emitted: {source["country"]} -> {target["country"]}')

            except Exception as e:
                print(f'Error emitting threat: {e}')

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 Bad Request"""
    return jsonify({
        'error': 'Bad request',
        'status': 'error'
    }), 400

@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found"""
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error"""
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print('V HUNTER Backend Server')
    print('=' * 50)
    print('[OK] Flask server starting...')
    print('[OK] Socket.io enabled')
    print('[OK] CORS enabled')
    print('[OK] Listening on http://0.0.0.0:5000')
    print('=' * 50)
    print()

    # Start background threat emitter thread
    threat_thread = threading.Thread(target=emit_random_threats, daemon=True)
    threat_thread.start()
    print('[OK] Background threat emitter started')
    print()

    # Run the server
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False,
        log_output=True
    )


