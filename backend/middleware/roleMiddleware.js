const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before checking permissions",
      });
    }

    const effectiveRole = req.user.role === "organization" ? "recruiter" : req.user.role;
    const allowedRoles = roles.flatMap((r) =>
      r === "recruiter" ? ["recruiter", "organization"] : [r]
    );

    if (!allowedRoles.includes(req.user.role) && !roles.includes(effectiveRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to perform this action`,
      });
    }

    next();
  };
};

module.exports = { authorize };
