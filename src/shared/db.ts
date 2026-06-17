// [INIT]: Import Dexie types and setup database class
import Dexie, { type Table } from "dexie";
import { type ClipData } from "./types";

// [PROCESS]: Define SnipAlt local store structure
class SnipAltDatabase extends Dexie {
  clips!: Table<ClipData>;

  constructor() {
    super("SnipAltDatabase");
    // Indexing id (autoIncrement) and timestamp for fast sorting
    this.version(1).stores({
      clips: "++id, timestamp",
    });
  }
}

// [UTIL]: Export a singleton database instance
export const db = new SnipAltDatabase();
