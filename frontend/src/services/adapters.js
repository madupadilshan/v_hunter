const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

function normalizeSeverity(value) {
  if (!value || typeof value !== 'string') {
    return 'Medium';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'critical') return 'Critical';
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      return value;
    }
  }
  return null;
}

function asCoordinate(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
}

function normalizeTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function getSeverityColor(severity) {
  if (severity === 'Critical') return 'rgba(239, 68, 68, 0.85)';
  if (severity === 'High') return 'rgba(249, 115, 22, 0.8)';
  if (severity === 'Medium') return 'rgba(234, 179, 8, 0.8)';
  return 'rgba(59, 130, 246, 0.8)';
}

function getArcAltitude(severity) {
  if (severity === 'Critical') return 0.3;
  if (severity === 'High') return 0.26;
  if (severity === 'Medium') return 0.22;
  return 0.18;
}

export function normalizeVulnerability(vulnerability, idx = 0) {
  return {
    id: vulnerability?.id ?? `v-${Date.now()}-${idx}`,
    name: vulnerability?.name || 'Unknown finding',
    severity: normalizeSeverity(vulnerability?.severity || vulnerability?.threat_level),
    description: vulnerability?.description || 'No description provided by backend.',
    cvss: asNumber(vulnerability?.cvss, 0),
  };
}

export function normalizeVulnerabilities(payload) {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.map(normalizeVulnerability);
  }

  if (Array.isArray(payload.vulnerabilities)) {
    return payload.vulnerabilities.map(normalizeVulnerability);
  }

  if (Array.isArray(payload.threats)) {
    return payload.threats.map((threat, idx) =>
      normalizeVulnerability(
        {
          id: threat.id ?? `t-${idx}`,
          name: threat.name || threat.threatType || 'Threat',
          severity: threat.severity || payload.threat_level,
          description: threat.description || threat.type || 'Threat intelligence item.',
          cvss: threat.cvss ?? 0,
        },
        idx
      )
    );
  }

  return [];
}

export function normalizeTopThreats(payload) {
  const candidates = payload?.threats || payload?.top_threats || [];
  if (!Array.isArray(candidates)) return [];

  return candidates.map((item) => ({
    country: item.country || 'Unknown',
    ips: `${item.ips ?? '0'}`,
    percentage: Math.max(0, Math.min(100, asNumber(item.percentage, 0))),
  }));
}

export function normalizeThreatEvent(event) {
  if (!event) return null;

  const source = typeof event.source === 'object' && event.source ? event.source : {};
  const target = typeof event.target === 'object' && event.target ? event.target : {};

  const startLat = asCoordinate(
    firstDefined(event.startLat, event.start_lat, event.sourceLat, event.source_lat, source.lat, source.latitude),
    -90,
    90
  );
  const startLng = asCoordinate(
    firstDefined(event.startLng, event.start_lng, event.sourceLng, event.source_lng, source.lng, source.longitude),
    -180,
    180
  );
  const endLat = asCoordinate(
    firstDefined(event.endLat, event.end_lat, event.targetLat, event.target_lat, target.lat, target.latitude),
    -90,
    90
  );
  const endLng = asCoordinate(
    firstDefined(event.endLng, event.end_lng, event.targetLng, event.target_lng, target.lng, target.longitude),
    -180,
    180
  );

  if (startLat === null || startLng === null || endLat === null || endLng === null) {
    return null;
  }

  const severity = normalizeSeverity(firstDefined(event.severity, event.level, event.threat_level, source.severity));

  const normalized = {
    id: firstDefined(event.id, event.threat_id, event.event_id, `${Date.now()}`),
    startLat,
    startLng,
    endLat,
    endLng,
    sourceCountry: firstDefined(event.sourceCountry, event.source_country, source.country, 'Unknown'),
    sourceCity: firstDefined(event.sourceCity, event.source_city, source.city, ''),
    sourceIp: firstDefined(event.sourceIp, event.source_ip, source.ip, source.ip_address, ''),
    targetCountry: firstDefined(event.targetCountry, event.target_country, target.country, 'Unknown'),
    targetCity: firstDefined(event.targetCity, event.target_city, target.city, ''),
    targetIp: firstDefined(event.targetIp, event.target_ip, target.ip, target.ip_address, ''),
    targetPort: firstDefined(event.targetPort, event.target_port, target.port, ''),
    protocol: firstDefined(event.protocol, target.protocol, ''),
    threatType: firstDefined(event.threatType, event.threat_type, event.type, 'Attack'),
    severity,
    color: firstDefined(event.color, getSeverityColor(severity)),
    timestamp: firstDefined(normalizeTimestamp(event.timestamp), normalizeTimestamp(event.created_at), 'Live'),
    arcAltitude: getArcAltitude(severity),
  };

  return normalized;
}

export function buildSeverityCounts(vulnerabilities) {
  return vulnerabilities.reduce(
    (acc, vulnerability) => {
      const severity = normalizeSeverity(vulnerability?.severity);
      const increment = asNumber(vulnerability?.count, 1);
      acc[severity] += increment;
      return acc;
    },
    {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    }
  );
}

export function normalizeSeveritySummary(payload) {
  const vulnerabilities = normalizeVulnerabilities(payload);
  const counts = buildSeverityCounts(vulnerabilities);

  return SEVERITIES.map((severity) => ({
    id: severity,
    severity,
    count: counts[severity],
  }));
}
