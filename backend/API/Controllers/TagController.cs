using DataLayer.DTOs.Tag;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{
    private readonly TagService tagService;
    public TagController(TagService tagService)
    {
        this.tagService = tagService;
    }

    [HttpGet("GetTagById/{id}")]
    public async Task<IActionResult> GetTagById(string id)
    {
        (bool isError, var project, ErrorMessage? error) = await tagService.GetTagById(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(project);
    }

    [HttpPost("CreateTag")]
    public async Task<IActionResult> Create([FromBody] CreateTagDTO tagDto)
    {
        (bool isError, var response, ErrorMessage? error) = await tagService.CreateTag(tagDto);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpPut("UpdateTag/{id}")]
    public async Task<IActionResult> UpdateTag(string id, [FromBody] UpdateTagDTO tagDto)
    {
        (bool isError, var response, ErrorMessage? error) = await tagService.UpdateTag(id, tagDto);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("DeleteTag/{id}")]
    public async Task<IActionResult> DeleteTag(string id)
    {
        (bool isError, _, ErrorMessage? error) = await tagService.DeleteTag(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return StatusCode(204);
    }

}