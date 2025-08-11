const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const getFirstAvatarUrl = (
  avatarString: string | null | undefined,
  fallback: string = '/assets/avatar/female.png'
): string => {
  if (!avatarString) return fallback;

  const avatars = avatarString
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);

  if (avatars.length === 0) return fallback;

  return `${API_BASE_URL}/${avatars[0]}`;
};

export default getFirstAvatarUrl;



