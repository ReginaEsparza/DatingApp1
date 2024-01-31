using API.Data;
using API.DTOs;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MessagesController : BaseApiController 
    {
        private IUserRepository _userRepository;
        private IMessageRepository _messageRepository;
        private IMapper _mapper;
        public MessagesController(IUserRepository userRepository, IMessageRepository messageRepository,
         IMapper mapper)
        {
            _userRepository = userRepository;
            _messageRepository = messageRepository;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<ActionResult<MessageDTO>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var username = User.GetUsername();

            if(username == createMessageDto.RecipientUsername.ToLower()) return BadRequest("You cannot send messages to yourself.");

            var sender = await _userRepository.GetUserByUserNameAsync(username);
            var recipient = await _userRepository.GetUserByUserNameAsync(createMessageDto.RecipientUsername);

            if(recipient == null) return NotFound();
            
            var message = new Message()
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync()) return Ok(_mapper.Map<MessageDTO>(message));

            return BadRequest("Failed to send message");
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<MessageDTO>>> GetMessagesForUser([FromQuery]MessagesParams messagesParams)
        {
            messagesParams.Username = User.GetUsername();

            var messages = await _messageRepository.GetMessageForUser(messagesParams);

            Response.AddPaginatonHeader(new PaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages));

            return messages;
        }

        [HttpGet("thread/{username}")]

        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetMessageThread(string username) 
        {
            var currentUserName = User.GetUsername();

            return Ok(await _messageRepository.GetMessageThread(currentUserName, username));
        }
    }
}