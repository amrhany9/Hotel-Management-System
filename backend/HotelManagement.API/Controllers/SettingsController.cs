using HotelManagement.Application.Common.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SettingsController : ControllerBase
{
    private readonly HotelSettings _hotel;
    private readonly DemoSettings _demo;

    public SettingsController(IOptions<HotelSettings> hotel, IOptions<DemoSettings> demo)
    {
        _hotel = hotel.Value;
        _demo = demo.Value;
    }

    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new
        {
            hotelName = _hotel.Name,
            address = _hotel.Address,
            phone = _hotel.Phone,
            email = _hotel.Email,
            currency = _hotel.Currency,
            demoMode = _demo.Enabled,
            demoResetHourUtc = _demo.DailyResetHourUtc
        });
    }
}
