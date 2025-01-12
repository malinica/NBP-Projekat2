using DataLayer.DTOs.Project;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly ProjectService projectService;
    private readonly UserService userService;
    public ProjectController(ProjectService projectService, UserService userService)
    {
        this.projectService = projectService;
        this.userService = userService;
    }

    [HttpGet("GetProjectById/{id}")]
    public async Task<IActionResult> GetProjectById(string id)
    {
        (bool isError, var project, ErrorMessage? error) = await projectService.GetProjectWithTagsAndAuthor(id);

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(project);
    }

    [HttpPost("CreateProject")]
    [Authorize]
    public async Task<IActionResult> Create([FromForm] CreateProjectDTO projectDto)
    {
        var userResult = await userService.GetCurrentUser(User);

        if (userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        var projectResult = await projectService.CreateProject(projectDto, userResult.Data.Id);
        
        if(projectResult.IsError)
            return StatusCode(projectResult.Error?.StatusCode ?? 400, projectResult.Error?.Message);

        return Ok(projectResult.Data);
    }

    [HttpPost("ApplyForProject/{projectId}/{userId}")]
    public async Task<IActionResult> ApplyForProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.ApplyForProject(projectId, userId);

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpPut("UpdateProject/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProject([FromForm] UpdateProjectDTO projectDto, string id)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.UpdateProject(projectDto, id);
        
        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("DeleteProject/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProject(string id)
    {
        (bool isError, _ , ErrorMessage? error) = await projectService.DeleteProject(id);

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return StatusCode(204);
    }  
    
    [HttpGet("SearchProjects")]
public async Task<IActionResult> SearchProjects(
    [FromQuery] string? title = null, 
    [FromQuery]List<string>? tags = null, 
    [FromQuery]DateTime? fromDate = null, 
    [FromQuery] DateTime?toDate = null,
    [FromQuery]int skip=0,
    [FromQuery]int limit=5)
{
    try
    {
        var result = await projectService.SearchProjects(
            title, 
            tags, 
            fromDate, 
            toDate,
            skip,
            limit);
        return Ok(result);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Došlo je do greške: {ex.Message}");
    }
}

}