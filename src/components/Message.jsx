import React from 'react';

const Message = ({ text, sender }) => {
  const isUser = sender === 'user';

  return (
    <div style={{
      textAlign: isUser ? 'right' : 'left',
      margin: '10px 0'
    }}>
      <div style={{
        display: 'inline-block',
        padding: '10px',
        borderRadius: '10px',
        background: isUser ? '#daf8cb' : '#eee'
      }}>
        {
          text.includes('•')
            ? text.split('•').map((line, index) => (
                <div key={index}>{line.trim()}</div>
              ))
            : <div style={{ whiteSpace: 'pre-line' }}>{text}</div>
        }
      </div>
    </div>
  );
};

export default Message;
