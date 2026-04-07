const rbac = (...roles) => {
  return (req, res, next) => {
    console.log(`[RBAC] Method: ${req.method} Path: ${req.path} UserRole: ${req.user?.role} RequiredRoles: ${roles.join(',')}`);
    if (!req.user) {
      console.log('[RBAC] No user found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      console.log(`[RBAC] Access denied for role: ${req.user.role}`);
      return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};

module.exports = rbac;
