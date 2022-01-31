import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import PropTypes from 'prop-types';
import { makeDetailAPICall } from './DataManager';

function getDetailText(detail) {
  if (detail == null) {
    return null;
  }
  let alertMsg = '';
  if (detail.lastCommitsUsers != null && detail.lastCommitsUsers.length > 0) {
    alertMsg = alertMsg.concat('Last 3 commits by ${detail.lastCommitsUsers[2]');
  }
  if (detail.lastForkUser != null && detail.lastForkUser.length > 0) {
    alertMsg = alertMsg.concat(`The last fork was created by ${detail.lastForkUser}`);
  }
  if (detail.ownerBio != null && detail.ownerBio.length > 0) {
    alertMsg = alertMsg.concat(`\nThe owner has this in their biography: "${detail.ownerBio}"`);
  }
  return alertMsg === '' ? 'Detail is currently not available' : alertMsg;
}

export default function RepoTable({ items }) {
  const [details, setDetails] = useState(null);
  useEffect(() => {
    makeDetailAPICall(items, setDetails);
  }, [items]);

  if (items == null || items.length === 0) {
    return null;
  }

  return (
    <Row>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Stars</th>
            <th>Link</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, key) => {
            const onClickDetails = () => {
              // eslint-disable-next-line no-alert
              alert(getDetailText(details[key]));
            };
            return (
              <tr>
                <td>{item.name}</td>
                <td>{item.owner.login}</td>
                <td>{item.stargazers_count}</td>
                <td><a target="blank" href={item.html_url}>{item.full_name}</a></td>
                <td><Button variant="primary" onClick={onClickDetails}>Details</Button></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Row>
  );
}

RepoTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
};

RepoTable.defaultProps = {
  items: [],
};
