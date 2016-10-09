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
    labels: p.labels,
  }),

  // Serialize a label
  label: l => ({
    id: l._id,
    name: l.name,
    creator: l.creator,
    created: l.created,
    updated: l.updated,
    color: l.color,
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
