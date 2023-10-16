const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) {
      return res.status(401).json({ message: 'not authorised' });
    }

    // convert roles to array
    const rolesArray = [...allowedRoles];

    // check if user has the role
    const results = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);
    if (!results) {
      return res.status(401).json({ message: 'not authorised' });
    }
    next();
  };
};

module.exports = verifyRoles;
