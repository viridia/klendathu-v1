import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import equal from 'deep-equal';
import AppsIcon from 'icons/ic_apps_black_24px.svg';
import ListIcon from 'icons/ic_list_black_24px.svg';
import BookmarkIcon from 'icons/ic_bookmark_border_black_24px.svg';
import PersonIcon from 'icons/ic_person_black_24px.svg';
import SettingsIcon from 'icons/ic_settings_black_24px.svg';
import LocalOfferIcon from 'icons/ic_local_offer_black_24px.svg';
import LeftNavDataQuery from '../../graphql/queries/leftNavData.graphql';
import LabelName from './labelName.jsx';
import './leftNav.scss';

export function NavItem({ title, icon, pathname, query = undefined, onlyActiveOnIndex = false }) {
  return (<Link
      className="item"
      activeClassName="active"
      onlyActiveOnIndex={onlyActiveOnIndex}
      to={{ pathname, query }}>{icon}{title}</Link>);
}

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  query: PropTypes.shape({}),
  onlyActiveOnIndex: PropTypes.bool,
};

class LeftNav extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.project.id !== nextProps.project.id
        || this.props.project.name !== nextProps.project.name
        || this.props.data.loading !== nextProps.data.loading
        || !equal(this.props.data.projectMembership, nextProps.data.projectMembership);
  }

  render() {
    const { project } = this.props;
    const { projectMembership, projects } = this.props.data;
    const filters = projectMembership ? projectMembership.filters : [];
    const labels = projectMembership ? projectMembership.labelsData : [];
    return (<nav className="kdt left-nav">
      <NavItem
          icon={<ListIcon />}
          title="All Issues"
          pathname={`/project/${project.name}/issues`}
          query={{ owner: undefined, label: undefined, type: undefined, state: undefined }} />
      <NavItem
          icon={<PersonIcon />}
          title="My Open Issues"
          pathname={`/project/${project.name}/issues`}
          query={{ owner: 'me', state: 'open' }} />
      <NavItem
          icon={<LocalOfferIcon />}
          title="Labels"
          pathname={`/project/${project.name}/labels`} />
      {labels && labels.length > 0 && <ul className="label-list">
        {labels.map(label => (
          <li className="label-item" key={label.id}>
            <Link to={{ pathname: `/project/${project.name}/issues`, query: { label: label.id } }}>
              <LabelName label={label.id} project={project.id} />
            </Link>
          </li>
        ))}
      </ul>}
      <NavItem
          icon={<BookmarkIcon />}
          title="Saved Filters"
          pathname={`/project/${project.name}/queries`} />
      {filters && filters.length > 0 && <ul className="filter-list">
        {filters.map(filter => (
          <li className="filter-item" key={filter.name}>
            <Link
                to={{
                  pathname: `/project/${project.name}/issues`,
                  query: JSON.parse(filter.value) }}>
              {filter.name}
            </Link>
          </li>
        ))}
      </ul>}
      <NavItem
          icon={<SettingsIcon />}
          title="Project Settings"
          pathname={`/project/${project.name}/settings`} />
      <NavItem icon={<AppsIcon />} title="Projects" onlyActiveOnIndex pathname="/" />
      {projects && projects.length > 0 && <ul className="project-list">
        {projects.map(p => (
          <li className="project-item" key={p.name}>
            <Link
                activeClassName="active"
                to={{ pathname: `/project/${p.name}/issues` }}>
              {p.name}
            </Link>
          </li>
        ))}
      </ul>}
    </nav>);
  }
}

LeftNav.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool,
    projectMembership: PropTypes.shape({}),
    projects: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default graphql(LeftNavDataQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(LeftNav);
