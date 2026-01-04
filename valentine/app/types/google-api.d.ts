interface GoogleUser {
  // Add any properties you need from the user object
  id?: string;
  email?: string;
}

interface Window {
  gapi: {
    load: (apiName: string, callback: () => void) => void;
    client: any;
    auth2: any;
  }
} 