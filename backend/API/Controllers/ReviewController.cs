using DataLayer.DTOs.Review;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService reviewService;
    public ReviewController(ReviewService reviewService)
    {
        this.reviewService = reviewService;
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
    public async Task<IActionResult> Create([FromBody] CreateReviewDTO reviewDto)
    {
        (bool isError, var response, ErrorMessage? error) = await reviewService.CreateReview(reviewDto);

        if (isError)
        {
            return StatusCode(error?.StatusCode ?? 400, error?.Message);
        }

        return Ok(response);
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