export default function humanAge(date) {
  if (!date) {
    return 'a while ago';
  }
  const ms = new Date() - date;
  const seconds = Math.floor(ms / 1000);
  if (seconds === 1) {
    return '1 second ago';
  }
  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes <= 1) {
    return '1 minute ago';
  }
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours <= 1) {
    return '1 hour ago';
  }
  if (hours < 24) {
    return `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  if (days <= 1) {
    return '1 day ago';
  }
  if (days < 25) {
    return `${days} days ago`;
  }
  const months = Math.floor(days / 30);
  if (months <= 1) {
    return '1 month ago';
  }
  if (months < 12) {
    return `${months} months ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} years ago`;
}
