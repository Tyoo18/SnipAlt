// [UTIL]: Base layout structure for captured web text snippets
export interface ClipData {
  id?: number;
  textContent: string;
  sourceUrl: string;
  pageTitle: string;
  timestamp: number;
}

// [UTIL]: Premium verified user authentication schema structure
export interface UserProfile {
  email: string;
  name: string;
  picture: string;
}
