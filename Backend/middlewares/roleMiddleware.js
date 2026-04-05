const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const normalizeRole = (role) => {
      const value = String(role || "").trim().toLowerCase();
      if (value === "customer") return "user";
      if (value === "dietitian") return "dietician";
      return value;
    };

    const allowedRoles = roles.map(normalizeRole);
    const currentRole = normalizeRole(req.user.role);

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export default allowRoles;