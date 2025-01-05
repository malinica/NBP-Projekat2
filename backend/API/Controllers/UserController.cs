using DataLayer.DTOs.User;

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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        (bool isError, var user, ErrorMessage? error) = await userService.GetById(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(user);
    }

    [HttpPost("Create")]
    public async Task<IActionResult> Create([FromBody] CreateUserDTO userDto)
    {
        (bool isError, var user, ErrorMessage? error) = await userService.Create(userDto);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(user);
    }

}
