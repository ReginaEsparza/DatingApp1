using API.Data;
using API.DTOs;
using API.Helpers;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        void AddMessage(Message message);
        void DeleteMessage(Message message);
        Task<Message> GetMessage(int id);
        Task<PagedList<MessageDTO>> GetMessageForUser(MessagesParams messagesParams);
        Task<IEnumerable<MessageDTO>> GetMessageThread(string currentUserName, string recipientUserName);
        Task<bool> SaveAllAsync();
    }

}