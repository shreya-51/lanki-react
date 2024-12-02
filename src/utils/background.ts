import { supabase } from "./supabase";

async function signInWithSupabase(idToken: string) {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;

    chrome.storage.local.set({ lankiIdToken: idToken });
    return data;
  } catch (error) {
    console.error('Supabase sign-in error:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'launchAuthFlow') {
    const manifest = chrome.runtime.getManifest();
    if (!manifest.oauth2 || !manifest.oauth2.client_id || !manifest.oauth2.scopes) {
        console.error('OAuth2 configuration is missing in manifest.json');
        sendResponse({ success: false, error: 'Invalid OAuth2 configuration' });
        return;
      }
    const url = new URL('https://accounts.google.com/o/oauth2/auth');
    url.searchParams.set('client_id', manifest.oauth2.client_id);
    url.searchParams.set('response_type', 'id_token');
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`);
    url.searchParams.set('scope', manifest.oauth2.scopes.join(' '));

    chrome.identity.launchWebAuthFlow(
      { url: url.href, interactive: true },
      async (redirectedTo) => {
        if (!redirectedTo) {
          sendResponse({ success: false, error: chrome.runtime.lastError });
          return;
        }
        const params = new URLSearchParams(new URL(redirectedTo).hash.substring(1));
        const idToken = params.get('id_token');

        if (idToken) {
          try {
            const data = await signInWithSupabase(idToken);
            sendResponse({ success: true, data });
          } catch (error) {
            sendResponse({ success: false, error });
          }
        } else {
          sendResponse({ success: false, error: 'No ID token found' });
        }
      }
    );

    return true; // Indicates async response
  }
});
