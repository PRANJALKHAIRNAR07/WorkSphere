function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before checking authorization roles.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Permission denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = authorizeRoles;
