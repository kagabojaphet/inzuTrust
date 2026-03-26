// services/auditLogService.js
// Call audit.log({...}) from any controller — fire and forget

const getDb = () => require("../model");

const SEVERITY = { INFO:"INFO", SUCCESS:"SUCCESS", WARNING:"WARNING", ERROR:"ERROR", CRITICAL:"CRITICAL" };

/**
 * Log an audit event.
 * @param {object} opts
 * @param {string}  opts.action      - Human-readable event name
 * @param {string}  [opts.actorId]   - User UUID (omit for system events)
 * @param {string}  [opts.actorName] - Cached display name
 * @param {string}  [opts.actorRole] - "admin"|"landlord"|"tenant"|"system"
 * @param {string}  [opts.target]    - Target entity description
 * @param {string}  [opts.severity]  - INFO|SUCCESS|WARNING|ERROR|CRITICAL
 * @param {string}  [opts.sourceIp]
 * @param {string}  [opts.userAgent]
 * @param {object}  [opts.metadata]  - Any extra JSON
 */
async function log(opts) {
  try {
    const { AuditLog } = getDb();
    await AuditLog.create({
      actorId:   opts.actorId   || null,
      actorName: opts.actorName || "System",
      actorRole: opts.actorRole || "system",
      action:    opts.action,
      target:    opts.target    || null,
      severity:  opts.severity  || SEVERITY.INFO,
      sourceIp:  opts.sourceIp  || null,
      userAgent: opts.userAgent || null,
      metadata:  opts.metadata  || null,
    });
  } catch (err) {
    // Never crash the caller — just warn
    console.warn("[AuditLog] Failed to write log:", err.message);
  }
}

/** Convenience helpers */
log.info     = (opts) => log({ ...opts, severity: SEVERITY.INFO     });
log.success  = (opts) => log({ ...opts, severity: SEVERITY.SUCCESS  });
log.warning  = (opts) => log({ ...opts, severity: SEVERITY.WARNING  });
log.error    = (opts) => log({ ...opts, severity: SEVERITY.ERROR    });
log.critical = (opts) => log({ ...opts, severity: SEVERITY.CRITICAL });

/** Extract IP + UA from Express req */
log.fromReq = (req) => ({
  sourceIp:  req.ip || req.headers["x-forwarded-for"]?.split(",")[0].trim() || null,
  userAgent: req.headers["user-agent"] || null,
});

module.exports = { log, SEVERITY };