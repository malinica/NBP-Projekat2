using DataLayer.DTOs.Review;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService reviewService;
    private readonly UserService userService;
    public ReviewController(ReviewService reviewService, UserService userService)
    {
        this.reviewService = reviewService;
        this.userService = userService;
    }

    [HttpGet("GetReviewById/{id}")]
    public async Task<IActionResult> GetReviewById(string id)
    {
        (bool isError, var project, ErrorMessage? error) = await reviewService.GetReviewById(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(project);
    }

    [HttpPost("CreateReview")]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewDTO reviewDto)
    {
        var userResult = await userService.GetCurrentUser(User);

        if(userResult.IsError)
            return StatusCode(userResult.Error?.StatusCode ?? 400, userResult.Error?.Message);
        
        var reviewResult = await reviewService.CreateReview(reviewDto, userResult.Data.Id);

        if (reviewResult.IsError)
            return StatusCode(reviewResult.Error?.StatusCode ?? 400, reviewResult.Error?.Message);

        return Ok(reviewResult.Data);
    }

    [HttpPut("UpdateReview/{id}")]
    public async Task<IActionResult> UpdateReview(string id, [FromBody] UpdateReviewDTO reviewDto)
    {
        (bool isError, var response, ErrorMessage? error) = await reviewService.UpdateReview(id, reviewDto);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
    }

    [HttpDelete("DeleteReview/{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        (bool isError, _, ErrorMessage? error) = await reviewService.DeleteReview(id);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return StatusCode(204);
    }

}