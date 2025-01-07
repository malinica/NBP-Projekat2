using DataLayer.DTOs.Project;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly ProjectService projectService;
    public ProjectController(ProjectService projectService)
    {
        this.projectService = projectService;
    }

    [HttpGet("GetProjectById/{id}")]
    public async Task<IActionResult> GetProjectById(string id)
    {
        (bool isError, var project, ErrorMessage? error) = await projectService.GetProjectById(id);

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(project);
    }

    [HttpPost("CreateProject")]
    public async Task<IActionResult> Create([FromBody] CreateProjectDTO projectDto)
    {
        (bool isError, var response, ErrorMessage? error) = await projectService.CreateProject(projectDto);

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("DeleteProject/{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        (bool isError, _ , ErrorMessage? error) = await projectService.DeleteProject(id);

        if(isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return StatusCode(204);
    }  
}