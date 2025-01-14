using DataLayer.DTOs.User;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService userService;

    public UserController(UserService userService)
    {
        this.userService = userService;
    }

    [HttpGet("GetUserById/{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        (bool isError, var user, ErrorMessage? error) = await userService.GetById(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(user);
    }

    [HttpGet("GetAllUsers")]
    public async Task<IActionResult> GetAllUsers()
    {
        (bool isError, var users, ErrorMessage? error) = await userService.GetAllUsers();

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(users);
    }

    [HttpPost("Register")]
    public async Task<IActionResult> Create([FromBody] CreateUserDTO userDto)
    {
        (bool isError, var response, ErrorMessage? error) = await userService.Register(userDto);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        (bool isError, var response, ErrorMessage? error) = await userService.Login(request);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpGet("GetProjectUsersByType/{type}/{projectId}")]
    [Authorize]
    public async Task<IActionResult> GetProjectUsersByType([FromRoute] string type, [FromRoute] string projectId, [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        (bool isError, var response, ErrorMessage? error) = await userService.GetProjectUsersByType(projectId, type, page ?? 1, pageSize ?? 10);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpGet("FilterUsers")]
    public async Task<IActionResult> FilterUsers(
        [FromQuery] string? username = null,
        [FromQuery] List<string>? tagsIds = null,
        [FromQuery] int? page = 1,
        [FromQuery] int? pageSize = 10)
    {
        (bool isError, var response, ErrorMessage? error) = await userService.FilterUsers(username, tagsIds, page, pageSize);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpGet("GetUserByUsername/{username}")]
    public async Task<IActionResult> GetUserByUsername(string username)
    {
        (bool isError, var user, ErrorMessage? error) = await userService.GetByUsername(username);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(user);
    }
    
    [HttpPost("FollowUser/{userId}")]
    [Authorize]
    public async Task<IActionResult> FollowUser(string userId)
    {
        var userResult = await userService.GetCurrentUser(User);

        if (userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        (bool isError, var isSuccessful, ErrorMessage? error) = 
            await userService.FollowUser(userResult.Data.Id, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }
        
        return Ok(isSuccessful);
    }
    
    [HttpDelete("UnfollowUser/{userId}")]
    [Authorize]
    public async Task<IActionResult> UnfollowUser(string userId)
    {
        var userResult = await userService.GetCurrentUser(User);

        if (userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        (bool isError, var isSuccessful, ErrorMessage? error) = 
            await userService.UnfollowUser(userResult.Data.Id, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }
        
        return Ok(isSuccessful);
    }
    
    [HttpGet("CheckIfUserFollows/{userId}")]
    [Authorize]
    public async Task<IActionResult> CheckIfUserFollows(string userId)
    {
        var userResult = await userService.GetCurrentUser(User);

        if (userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        (bool isError, var isFollowing, ErrorMessage? error) = 
            await userService.CheckIfUserFollows(userResult.Data.Id, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }
        
        return Ok(isFollowing);
    }
    
    [HttpGet("GetSuggestedUsers")]
    [Authorize]
    public async Task<IActionResult> GetSuggestedUsers()
    {
        var userResult = await userService.GetCurrentUser(User);

        if (userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        (bool isError, var suggestedUsers, ErrorMessage? error) = 
            await userService.GetSuggestedUsers(userResult.Data.Id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }
        
        return Ok(suggestedUsers);
    }
}
