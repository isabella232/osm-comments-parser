CREATE INDEX changesets_created_at_idx ON changesets(created_at);

CREATE INDEX changesets_closed_at_idx ON changesets(closed_at);

CREATE INDEX changesets_is_open_idx ON changesets(is_open);

CREATE INDEX changesets_bbox_idx ON changesets USING GIST(bbox);

CREATE INDEX changesets_num_changes_idx ON changesets(num_changes);

CREATE INDEX changesets_user_id_idx ON changesets(user_id);

CREATE INDEX changeset_tags_key_idx ON changeset_tags(key);

CREATE INDEX changeset_tags_value_tsvector_idex ON changeset_tags USING gin(to_tsvector('english', value));

-- Separate B-Tree index for values since we sometimes will do exact match and sometimes tsquery searches
CREATE INDEX changeset_tags_value_idx ON changeset_tags(value);

CREATE INDEX changeset_tags_changeset_id_idx ON changeset_tags(changeset_id);

CREATE INDEX changeset_comments_changeset_id_idx ON changeset_comments(changeset_id);

CREATE INDEX changeset_comments_user_id_idx ON changeset_comments(user_id);

CREATE INDEX changeset_comments_comment_tsvector_idx ON changeset_comments USING gin(to_tsvector('english', comment));

CREATE INDEX notes_created_at_idx ON notes(created_at);

CREATE INDEX notes_closed_at_idx ON notes(closed_at);

CREATE INDEX notes_opened_by_idx ON notes(opened_by);

CREATE INDEX notes_point_idx ON notes USING gist(point);

CREATE INDEX note_comments_note_id_idx ON note_comments(note_id);

CREATE INDEX note_comments_action_idx ON note_comments(action);

CREATE INDEX note_comments_user_id_idx ON note_comments(user_id);

CREATE INDEX note_comments_timestamp_idx ON note_comments(timestamp);

CREATE INDEX note_comments_comment_tsvector_idx ON note_comments USING gin(to_tsvector('english', comment));

CREATE INDEX users_name_idx ON users(name);
