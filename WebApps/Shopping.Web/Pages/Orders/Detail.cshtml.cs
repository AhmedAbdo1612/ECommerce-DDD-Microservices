using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Ordering;
using Shopping.Web.Services;

namespace Shopping.Web.Pages.Orders
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class DetailModel : PageModel
    {
        private readonly IOrderingService _orderingService;

        public DetailModel(IOrderingService orderingService)
        {
            _orderingService = orderingService;
        }

        public OrderModel Order { get; set; } = default!;
        public string ErrorMessage { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            try
            {
                var response = await _orderingService.GetOrderById(id);
                Order = response?.Order!;

                if (Order != null)
                {
                    if (!User.IsInRole("Admin") && !User.IsInRole("Manager"))
                    {
                        var customerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                        if (!Guid.TryParse(customerIdClaim, out Guid customerId) || Order.CustomerId != customerId)
                        {
                            Order = null!;
                            ErrorMessage = "Order not found or access denied.";
                        }
                    }
                }

                if (Order == null)
                {
                    ErrorMessage = "Order not found or access denied.";
                }
            }
            catch (ApiException ex)
            {
                ErrorMessage = $"API Error: {ex.StatusCode}";
            }
            catch (Exception)
            {
                ErrorMessage = "An unexpected error occurred.";
            }

            return Page();
        }

        public async Task<IActionResult> OnPostUpdateStatusAsync(Guid id, int newStatus)
        {
            if (!User.IsInRole("Admin") && !User.IsInRole("Manager"))
            {
                return Forbid();
            }

            try
            {
                var response = await _orderingService.GetOrderById(id);
                var order = response?.Order;
                
                if (order != null)
                {
                    var updatedOrder = order with { Status = (OrderStatus)newStatus };
                    var updateRequest = new UpdateOrderRequest(updatedOrder);
                    await _orderingService.UpdateOrder(updateRequest);
                    TempData["SuccessMessage"] = "Order status updated successfully.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Failed to update order status.";
            }

            return RedirectToPage(new { id });
        }
    }
}
