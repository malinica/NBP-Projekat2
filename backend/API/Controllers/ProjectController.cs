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

        if (isError)
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

        if (projectResult.IsError)
            return StatusCode(projectResult.Error?.StatusCode ?? 400, projectResult.Error?.Message);

        return Ok(projectResult.Data);
    }

    [HttpPost("ApplyForProject/{projectId}/{userId}")]
    public async Task<IActionResult> ApplyForProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.ApplyForProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("CancelProjectApplication/{projectId}/{userId}")]
    public async Task<IActionResult> CancelProjectApplication(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.CancelApplicationForProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpPost("AcceptUserToProject/{projectId}/{userId}")]
    public async Task<IActionResult> AcceptUserToProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.AcceptUserToProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("RemoveUserFromProject/{projectId}/{userId}")]
    public async Task<IActionResult> RemoveUserFromProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.RemoveUserFromProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpPost("InviteUserToProject/{projectId}/{userId}")]
    public async Task<IActionResult> InviteUserToProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.InviteUserToProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }
    
    [HttpPost("AcceptInvitationToProject/{projectId}/{userId}")]
    public async Task<IActionResult> AcceptInvitationToProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.AcceptInvitationToProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }


    [HttpDelete("CancelInvitationToProject/{projectId}/{userId}")]
    public async Task<IActionResult> CancelInvitationToProject(string projectId, string userId)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.CancelInvitationToProject(projectId, userId);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }
    
    [HttpGet("GetUserProjectRelationship/{projectId}")]
    [Authorize]
    public async Task<IActionResult> GetUserProjectRelationship(string projectId)
    {
        var userResult = await userService.GetCurrentUser(User);

        if (userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        (bool isError, var relationship, ErrorMessage? error) = 
            await projectService.GetUserProjectRelationship(projectId, userResult.Data.Id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }
        
        return Ok(relationship);
    }
    
    [HttpPut("UpdateProject/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProject([FromForm] UpdateProjectDTO projectDto, string id)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.UpdateProject(projectDto, id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("DeleteProject/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProject(string id)
    {
        (bool isError, _, ErrorMessage? error) = await projectService.DeleteProject(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return StatusCode(204);
    }

    [HttpGet("SearchProjects")]
    public async Task<IActionResult> SearchProjects(
    [FromQuery] string? title = null,
    [FromQuery] List<string>? tags = null,
    [FromQuery] DateTime? fromDate = null,
    [FromQuery] DateTime? toDate = null,
    [FromQuery] int skip = 0,
    [FromQuery] int limit = 10)
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

    [HttpGet("SearchProjectsCreatedByUser/{userId}/{status}")]
    public async Task<IActionResult> SearchProjectsCreatedByUser(string userId, string status)
    {
        (bool isError, var projects, ErrorMessage? error) = await projectService.SearchProjectsCreatedByUser(userId, status);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(projects);
    }
}