import React, { useState } from 'react';
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
  const { lastCommitUsers, lastForkUser, ownerBio } = detail;
  if (lastCommitUsers != null && lastCommitUsers.length > 0) {
    alertMsg = alertMsg.concat(`Last 3 commits by ${lastCommitUsers}`);
  }
  if (lastForkUser != null && lastForkUser.length > 0) {
    alertMsg = alertMsg.concat(`\nThe last fork was created by ${lastForkUser}`);
  }
  if (ownerBio != null && ownerBio.length > 0) {
    alertMsg = alertMsg.concat(`\nThe owner has this in their biography: "${ownerBio}"`);
  }
  return alertMsg === '' ? 'Detail is currently not available' : alertMsg;
}

export default function RepoTable({ items }) {
  const [targetIndex, setTargetIndex] = useState(null);
  const [isLoading, setLoading] = useState(false);

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
            const onClickDetails = async () => {
              setLoading(true);
              setTargetIndex(key);
              const detail = await makeDetailAPICall(item, setLoading);
              // eslint-disable-next-line no-alert
              alert(getDetailText(detail));
            };
            return (
              <tr>
                <td>{item.name}</td>
                <td>{item.owner.login}</td>
                <td>{item.stargazers_count}</td>
                <td><a target="blank" href={item.html_url}>{item.full_name}</a></td>
                <td>
                  <Button
                    variant="primary"
                    disabled={key === targetIndex && isLoading}
                    onClick={onClickDetails}
                  >
                    Details
                  </Button>

                </td>
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
