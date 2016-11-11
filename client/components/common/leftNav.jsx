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
import LabelsQuery from '../../graphql/queries/labels.graphql';
import LabelName from './labelName.jsx';
import './leftNav.scss';

export function NavItem({ title, icon, path, query = undefined, onlyActiveOnIndex = false }) {
  return (<Link
      className="item"
      activeClassName="active"
      onlyActiveOnIndex={onlyActiveOnIndex}
      to={{ pathname: path, query }}>{icon}{title}</Link>);
}

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  query: PropTypes.shape({}),
  onlyActiveOnIndex: PropTypes.bool,
};

class LeftNav extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.project.id !== nextProps.project.id
        || this.props.project.name !== nextProps.project.name
        || !equal(this.props.data.labels, nextProps.data.labels);
  }

  render() {
    const { project } = this.props;
    const { labels } = this.props.data;
    return (<nav className="kdt left-nav">
      <NavItem
          icon={<ListIcon />}
          title="All Issues"
          path={`/project/${project.name}/issues`}
          query={{ owner: undefined }} />
      <NavItem
          icon={<PersonIcon />}
          title="My Open Issues"
          path={`/project/${project.name}/issues`}
          query={{ owner: 'me', state: 'open' }} />
      <NavItem
          icon={<LocalOfferIcon />}
          title="Labels"
          path={`/project/${project.name}/labels`} />
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
          path={`/project/${project.name}/queries`} />
      <NavItem
          icon={<SettingsIcon />}
          title="Project Settings"
          path={`/project/${project.name}/settings`} />
      <NavItem icon={<AppsIcon />} title="Dashboard" onlyActiveOnIndex path="/" />
    </nav>);
  }
}

LeftNav.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default graphql(LabelsQuery, {
  options: ({ project }) => ({ variables: { project: project.id } }),
})(LeftNav);
