// JWT auth middleware stub
// In production, implement proper JWT verification
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // For development, allow requests without auth
      // In production, uncomment below:
      // return res.status(401).json({ error: 'Unauthorized' });
      req.user = { id: 'dev-user-1', email: 'dev@stockmaster.com' };
      return next();
    }

    // TODO: Implement JWT verification
    // const decoded = verifyToken(token);
    // req.user = decoded;
    
    req.user = { id: 'dev-user-1', email: 'dev@stockmaster.com' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


