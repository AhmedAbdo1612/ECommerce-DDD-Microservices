using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Ordering;
using Shopping.Web.Services;

namespace Shopping.Web.Pages.Orders
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class IndexModel : PageModel
    {
        private readonly IOrderingService _orderingService;

        public IndexModel(IOrderingService orderingService)
        {
            _orderingService = orderingService;
        }

        public IEnumerable<OrderModel> OrderList { get; set; } = new List<OrderModel>();
        public string ErrorMessage { get; set; } = default!;

        [BindProperty(SupportsGet = true)]
        public int PageNumber { get; set; } = 0;

        [BindProperty(SupportsGet = true)]
        public string SearchQuery { get; set; } = default!;

        [BindProperty(SupportsGet = true)]
        public OrderStatus? Status { get; set; }

        public bool HasNextPage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                if (User.IsInRole("Admin") || User.IsInRole("Manager"))
                {
                    // Admin/Manager view all orders
                  
                    var response = await _orderingService.GetOrders(PageNumber, 10);
                    if (response?.orders != null)
                    {
                        
                        var orders = response.orders;
                        if (!string.IsNullOrEmpty(SearchQuery))
                        {
                            orders = orders.Where(o => o.OrderName.Contains(SearchQuery, StringComparison.OrdinalIgnoreCase) || 
                                                       o.Id.ToString().Contains(SearchQuery, StringComparison.OrdinalIgnoreCase));
                        }

                        if (Status.HasValue)
                        {
                            orders = orders.Where(o => o.Status == Status.Value);
                        }

                        OrderList = orders.ToList();
                        HasNextPage = orders.Count() == 10;
                    }
                }
                else
                {
                    // Customer view their own orders
                    var customerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if (Guid.TryParse(customerIdClaim, out Guid customerId))
                    {
                        var response = await _orderingService.GetOrdersByCustomer(customerId);
                        if (response?.orders != null)
                        {
                            var orders = response.orders;
                            
                            if (!string.IsNullOrEmpty(SearchQuery))
                            {
                                orders = orders.Where(o => o.OrderName.Contains(SearchQuery, StringComparison.OrdinalIgnoreCase) || 
                                                           o.Id.ToString().Contains(SearchQuery, StringComparison.OrdinalIgnoreCase));
                            }

                            if (Status.HasValue)
                            {
                                orders = orders.Where(o => o.Status == Status.Value);
                            }
                            
                            OrderList = orders.ToList();
                            HasNextPage = false; 
                        }
                    }
                    else
                    {
                        ErrorMessage = "Unable to identify customer.";
                    }
                }
            }
            catch (ApiException ex)
            {
                ErrorMessage = $"API Error: {ex.StatusCode}";
            }
            catch (Exception)
            {
                ErrorMessage = "An unexpected error occurred while fetching orders.";
            }

            return Page();
        }

        public async Task<IActionResult> OnPostDeleteOrderAsync(Guid orderId)
        {
            if (!User.IsInRole("Admin") && !User.IsInRole("Manager"))
            {
                return Forbid();
            }

            try
            {
                await _orderingService.DeleteOrder(orderId);
                TempData["SuccessMessage"] = "Order deleted successfully.";
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Error deleting order.";
            }

            return RedirectToPage();
        }
    }
}
