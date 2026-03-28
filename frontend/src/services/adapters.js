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

  return {
    startLat: asNumber(event.startLat, 0),
    startLng: asNumber(event.startLng, 0),
    endLat: asNumber(event.endLat, 0),
    endLng: asNumber(event.endLng, 0),
    sourceCountry: event.sourceCountry || 'Unknown',
    targetCountry: event.targetCountry || 'Unknown',
    threatType: event.threatType || event.type || 'Attack',
    color: event.color || 'rgba(255, 0, 85, 0.8)',
  };
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
