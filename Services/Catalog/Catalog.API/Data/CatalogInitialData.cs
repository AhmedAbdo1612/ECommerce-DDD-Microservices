using Marten.Schema;

namespace Catalog.API.Data
{
    public class CatalogInitialData : IInitialData
    {
        public async Task Populate(IDocumentStore store, CancellationToken cancellation)
        {
            using var session = store.LightweightSession();
            if (await session.Query<Product>().AnyAsync())
            {
                return;
            }
            session.Store<Product>(GetPreinitializedProducts());
            await session.SaveChangesAsync();
        }



        private static IEnumerable<Product> GetPreinitializedProducts()
        {

            return new List<Product>
            {
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "MacBook Pro 16\"",
                    Category = new List<string> { "Electronics", "Computers", "Laptops" },
                    Description = "High-performance laptop with M3 Max chip, 32GB RAM, and 1TB SSD. Perfect for developers and creators.",
                    ImageFile = "macbook-pro-16.png",
                    Price = 2499.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "iPhone 15 Pro",
                    Category = new List<string> { "Electronics", "Mobile Phones", "Smartphones" },
                    Description = "Titanium design, A17 Pro chip, advanced 48MP main camera, and USB-C support.",
                    ImageFile = "iphone-15-pro.png",
                    Price = 999.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Sony WH-1000XM5",
                    Category = new List<string> { "Electronics", "Audio", "Headphones" },
                    Description = "Industry-leading wireless noise-canceling over-ear headphones with exceptional sound quality.",
                    ImageFile = "sony-wh1000xm5.png",
                    Price = 348.00m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Dell UltraSharp 27\" 4K Monitor",
                    Category = new List<string> { "Electronics", "Computers", "Monitors" },
                    Description = "27-inch 4K USB-C hub monitor featuring brilliant color coverage and extensive connectivity.",
                    ImageFile = "dell-ultrasharp-27.png",
                    Price = 479.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Logitech MX Master 3S",
                    Category = new List<string> { "Electronics", "Computer Accessories", "Mice" },
                    Description = "An iconic ergonomic wireless mouse optimized for developers, programmers, and designers.",
                    ImageFile = "logitech-mx-master-3s.png",
                    Price = 99.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Keychron K2 Mechanical Keyboard",
                    Category = new List<string> { "Electronics", "Computer Accessories", "Keyboards" },
                    Description = "Wireless mechanical keyboard with Gateron switches and RGB backlighting, Mac & Windows compatible.",
                    ImageFile = "keychron-k2.png",
                    Price = 89.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Samsung Galaxy Tablet S9",
                    Category = new List<string> { "Electronics", "Mobile Phones", "Tablets" },
                    Description = "11-inch AMOLED display tablet with S Pen included, IP68 water resistance, and Snapdragon 8 Gen 2.",
                    ImageFile = "samsung-tab-s9.png",
                    Price = 799.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Anker 737 Power Bank",
                    Category = new List<string> { "Electronics", "Accessories", "Chargers" },
                    Description = "24,000mAh portable charger with 140W two-way fast charging and smart digital display.",
                    ImageFile = "anker-737-powerbank.png",
                    Price = 149.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Kindle Paperwhite",
                    Category = new List<string> { "Electronics", "E-Readers", "Books" },
                    Description = "6.8-inch glare-free display with adjustable warm light and waterproof design for reading anywhere.",
                    ImageFile = "kindle-paperwhite.png",
                    Price = 139.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Ergonomic Office Chair",
                    Category = new List<string> { "Furniture", "Office", "Chairs" },
                    Description = "High-back mesh desk chair with dynamic lumbar support, 3D armrests, and adjustable tilt.",
                    ImageFile = "ergonomic-chair.png",
                    Price = 299.00m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Electric Standing Desk",
                    Category = new List<string> { "Furniture", "Office", "Desks" },
                    Description = "Height adjustable motorized desk with memory presets and a spacious 55x28 inch wooden top.",
                    ImageFile = "standing-desk.png",
                    Price = 349.50m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Sony PlayStation 5",
                    Category = new List<string> { "Electronics", "Gaming", "Consoles" },
                    Description = "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion, and 4K gaming.",
                    ImageFile = "ps5-console.png",
                    Price = 499.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Elgato Stream Deck MK.2",
                    Category = new List<string> { "Electronics", "Gaming", "Streaming Accessories" },
                    Description = "Studio controller with 15 macro keys for triggering actions in OBS, Twitch, YouTube, and more.",
                    ImageFile = "stream-deck-mk2.png",
                    Price = 149.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Seagate Portable 2TB External HDD",
                    Category = new List<string> { "Electronics", "Storage", "Hard Drives" },
                    Description = "USB 3.0 portable external hard drive for easily backing up files on PC, Mac, or Chromebook.",
                    ImageFile = "seagate-2tb-hdd.png",
                    Price = 64.99m
                },
                new Product
                {
                    Id = Guid.NewGuid(),
                    Name = "Apple Watch Ultra 2",
                    Category = new List<string> { "Electronics", "Smartwatches", "Wearables" },
                    Description = "Rugged smartwatch with custom titanium case, precision dual-frequency GPS, and up to 36-hour battery life.",
                    ImageFile = "apple-watch-ultra2.png",
                    Price = 799.00m
                }

            };

        }
    }
}

