import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    // Expect async/await fn to fail.
    let failed = false;

    // Create instance of a ticket
    const ticket = Ticket.build({
        title: 'Test title',
        price: 11,
        userId: 'asdssd23e231',
    });
    // Save to DB
    await ticket.save();

    // Fetch the ticket
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Update twice the ticket
    firstInstance!.set({ price: 20 });
    secondInstance!.set({ price: 30 });

    // save the first update
    await firstInstance!.save();

    // save the second update expect an error
    try {
        await secondInstance!.save();
    } catch (error) {
        failed = true;
    }

    expect(failed).toBeTruthy();
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Test title',
        price: 11,
        userId: 'asdssd23e231',
    });

    await ticket.save()
    expect(ticket.version).toEqual(0)
    
    await ticket.save()
    expect(ticket.version).toEqual(1)

    await ticket.save()
    expect(ticket.version).toEqual(2)
})