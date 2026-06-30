using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.Orders.Queries.GetOrdersByCustomer;

namespace Ordering.API.GetOrderByCustomer
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController(ISender sender) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetOrders(Guid id)
        {
            var result = await sender.Send(new GetOrdersByCustomerQuery(id));
            return Ok(result);
        }
    }
}
