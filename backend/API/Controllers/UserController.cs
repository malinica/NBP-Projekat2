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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDTO userDto)
    {
        try {
            (bool isError, var user, ErrorMessage? error) = await userService.Create(userDto);

            if (isError)
            {
                return StatusCode(error?.StatusCode ?? 400, error?.Message);
            }

            return Ok(user);
        }
        catch (Exception)
        {
            return BadRequest("Došlo je do greške prilikom kreiranja korisnika.");
        }
    }
}
