using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
          _context = context;
          _mapper = mapper;
        }
        public void AddMessage(Message message)
        {
           _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FindAsync(id);
        }

        public async Task<PagedList<MessageDTO>> GetMessageForUser(MessagesParams messagesParams) 
        {
            var query = _context.Messages
            .OrderByDescending(x => x.MessageSent)
            .AsQueryable();

            query = messagesParams.Container switch
            {
                "Inbox" => query.Where(u => u.RecipientUsername == messagesParams.Username),
                "Outbox" => query.Where(u => u.Sender.UserName == messagesParams.Username),
                _ => query.Where( u => u.RecipientUsername == messagesParams.Username && u.DateRead == null)
            };

            var messages = query.ProjectTo<MessageDTO>(_mapper.ConfigurationProvider);

            return await PagedList<MessageDTO>
            .CreateAsync(messages, messagesParams.PageNumber, messagesParams.PageSize);
        }

        public Task<IEnumerable<MessageDTO>> GetMessageThread(int currentUserId, int recipientId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}