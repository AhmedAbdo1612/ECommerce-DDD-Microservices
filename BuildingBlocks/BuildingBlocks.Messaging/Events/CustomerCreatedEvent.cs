namespace BuildingBlocks.Messaging.Events;

public record CustomerCreatedEvent(Guid Id, string Name, string Email);

