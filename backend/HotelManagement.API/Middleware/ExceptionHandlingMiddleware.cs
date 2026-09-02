using System.Net;
using System.Text.Json;
using HotelManagement.Application.Common.Exceptions;

namespace HotelManagement.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var statusCode = HttpStatusCode.InternalServerError;
        object errorResponse;

        switch (exception)
        {
            case ValidationException validationEx:
                statusCode = HttpStatusCode.BadRequest;
                errorResponse = new
                {
                    status = (int)statusCode,
                    title = "Validation Failed",
                    errors = validationEx.Errors
                };
                break;

            case NotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                errorResponse = new
                {
                    status = (int)statusCode,
                    title = "Resource Not Found",
                    detail = notFoundEx.Message
                };
                break;

            case ConflictException conflictEx:
                statusCode = HttpStatusCode.Conflict;
                errorResponse = new
                {
                    status = (int)statusCode,
                    title = "Conflict",
                    detail = conflictEx.Message
                };
                break;

            case UnauthorizedAccessException unauthorizedEx:
                statusCode = HttpStatusCode.Unauthorized;
                errorResponse = new
                {
                    status = (int)statusCode,
                    title = "Unauthorized",
                    detail = unauthorizedEx.Message
                };
                break;

            default:
                _logger.LogError(exception, "An unhandled exception occurred during request execution.");
                statusCode = HttpStatusCode.InternalServerError;
                errorResponse = new
                {
                    status = (int)statusCode,
                    title = "Internal Server Error",
                    detail = "An unexpected error occurred. Please try again later."
                };
                break;
        }

        response.StatusCode = (int)statusCode;
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await response.WriteAsync(JsonSerializer.Serialize(errorResponse, options));
    }
}
