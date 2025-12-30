const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const STORAGE_BASE_URL = API_BASE_URL.replace('/api', '');

/**
 * Get all avatar URLs from a comma-separated string
 */
export const getAllAvatarUrls = (
  avatarString: string | null | undefined,
  fallback: string = '/assets/avatar/female.png'
): string[] => {
  if (!avatarString) {
    return [fallback];
  }

  const avatars = avatarString
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);

  if (avatars.length === 0) {
    return [fallback];
  }

  // Construct proper storage URLs
  return avatars.map(avatar => {
    // If the avatar path already starts with /storage, use it as-is
    if (avatar.startsWith('/storage/')) {
      return `${STORAGE_BASE_URL}${avatar}`;
    }
    // If it's already a full URL, return as-is
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    // Otherwise, construct the full storage URL
    return `${STORAGE_BASE_URL}/storage/${avatar}`;
  });
};

/**
 * Get the first avatar URL from a comma-separated string
 */
export const getFirstAvatarUrl = (
  avatarString: string | null | undefined,
  fallback: string = '/assets/avatar/female.png'
): string => {
  const avatarUrls = getAllAvatarUrls(avatarString, fallback);
  return avatarUrls[0] || fallback;
};

export default getFirstAvatarUrl;



