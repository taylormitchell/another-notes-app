type Migration = {
  version: number;
  sql: string;
};

export const migrations: Migration[] = [
  {
    version: 0,
    sql: `
  -- Create the 'Note' table
  CREATE TABLE IF NOT EXISTS Note (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
  );
  
  -- Create the 'List' table
  CREATE TABLE IF NOT EXISTS List (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
  );
  
  -- Create the 'ListEntry' table
  CREATE TABLE IF NOT EXISTS ListEntry (
      id TEXT PRIMARY KEY,
      parent_list_id TEXT NOT NULL,
      child_note_id TEXT,
      child_list_id TEXT,
      position TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (parent_list_id) REFERENCES List(id),
      FOREIGN KEY (child_note_id) REFERENCES Note(id),
      FOREIGN KEY (child_list_id) REFERENCES List(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_listentry_parent_list_id ON ListEntry (parent_list_id);
  CREATE INDEX IF NOT EXISTS idx_listentry_child_note_id ON ListEntry (child_note_id);
  CREATE INDEX IF NOT EXISTS idx_listentry_child_list_id ON ListEntry (child_list_id);
  
  -- Cascade delete from 'ListEntry' table when deleting from 'List' table
  CREATE TRIGGER IF NOT EXISTS delete_list_cascade
  AFTER DELETE ON List
  FOR EACH ROW
  BEGIN
      DELETE FROM ListEntry WHERE parent_list_id = OLD.id;
  END;
  
  -- Cascade delete from 'ListEntry' table when deleting from 'Note' table
  CREATE TRIGGER IF NOT EXISTS delete_note_cascade
  AFTER DELETE ON Note
  FOR EACH ROW
  BEGIN
      DELETE FROM ListEntry WHERE child_note_id = OLD.id;
  END;
      `,
  },
  {
    version: 1,
    sql: `
      -- Set the schema version
      PRAGMA user_version = 1;
      `,
  },
  // add upvote column to note table if not exists
  {
    version: 2,
    sql: `
      ALTER TABLE Note ADD COLUMN upvotes INTEGER DEFAULT 0;
      PRAGMA user_version = 2;
      `,
  },
];
