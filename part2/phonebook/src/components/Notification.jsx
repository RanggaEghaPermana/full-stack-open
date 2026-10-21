const Notification = ({ notification }) => notification ? (
  <p role={notification.type === 'error' ? 'alert' : 'status'} className={`notification ${notification.type}`}>
    {notification.message}
  </p>
) : null
export default Notification
