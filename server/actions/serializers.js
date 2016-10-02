module.exports = {
  // Serialize a project
  project: p => ({
    name: p.name,
    title: p.title,
    description: p.description,
    owningUser: p.owningUser,
    owningOrg: p.owningOrg,
    created: p.created,
    updated: p.updated,
  }),

  // Serialize userInfo
  userInfo: u => ({
    id: u._id,
    username: u.username,
    fullname: u.fullname,
    photo: u.photo,
  }),

  // Serialize profile
  profile: u => ({
    id: u._id,
    fullname: u.fullname,
    username: u.username,
    photo: u.photo,
    verified: u.verified,
  }),
};
