<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let todo;
  let newUpdate = ''; // For the new status update input

  let isLoading = false;

  // Watch for changes in todo.id and fetch updates
  $: if (todo && todo.id) {
    fetchTodoWithUpdates();
  }

  // Function to fetch todo with updates
  async function fetchTodoWithUpdates() {
    try {
      const response = await fetch(`http://localhost:5000/todos/${todo.id}`);
      if (!response.ok) throw new Error('Failed to fetch todo');
      const data = await response.json();
      // Preserve the todo title and description but update the updates array
      todo = {
        ...todo,
        updates: data.updates || []
      };
    } catch (err) {
      console.error('Error fetching todo:', err);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US',{ 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }); 
  }

  async function deleteTodo() {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        const response = await fetch(`http://localhost:5000/todos/${todo.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete todo');
        }

        dispatch('refresh');
      } catch (err) {
        alert('Failed to delete todo');
      }
    }
  }

  // New function to add status update
  async function addStatusUpdate(event) {
    event.preventDefault();
    if (!newUpdate.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/todos/${todo.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ update: newUpdate })
      });

      if (!response.ok){ 
        const error = await response.json();
        throw new Error('Failed to add update');
    }
      const updatedTodo = await response.json();
      todo = updatedTodo; // Update the local todo object
      newUpdate = ''; // Clear the input
    } catch (err) {
      alert('Failed to add update');
    }
  }

   // Add new function to handle completion
   async function handleComplete() {
    if (!confirm('Are you sure you want to mark this task as complete?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/todos/${todo.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to complete todo');
      
      const updatedTodo = await response.json();
      todo = { ...todo, completed: updatedTodo.completed };
      dispatch('refresh');
    } catch (err) {
      alert('Failed to complete todo');
    }
  }
</script>

<div class="details-container">
  <h2>{todo.title}</h2>
  
  <div class="meta-info">
    <span class="created-at">
      <i class="far fa-clock"></i> 
      Created: {formatDate(todo.created_at)}
    </span>
    {#if todo.completed}
      <span class="completed-status">
        <i class="fas fa-check-circle"></i> Completed
      <span class="completed-date"> on {formatDate(todo.completed_at)}
       </span>
      </span>
    {/if}
  </div>
  
  <div class="description">
    <p>{todo.description}</p>
  </div>

  <div class="updates-section">
    <h3>Progress Updates</h3>
    
    {#if !todo.completed}
      <form class="update-form" on:submit={addStatusUpdate}>
        <textarea
          bind:value={newUpdate}
          placeholder="Add a progress update..."
          rows="1"
        ></textarea>
        <button type="submit" class="update-btn">
          <i class="fas fa-plus"></i> Add Update
        </button>
      </form>
    {/if}

    <div class="updates-list">
      {#if todo.updates && todo.updates.length > 0}
        {#each todo.updates as update}
          <div class="update-item">
            <div class="update-content">{update.text}</div>
            <div class="update-date">
              <i class="far fa-clock"></i> 
              {formatDate(update.date)}
            </div>
          </div>
        {/each}
      {:else}
        <p class="no-updates">No progress updates yet</p>
      {/if}
    </div>
  </div>

  <div class="actions">
    {#if !todo.completed}
      <button class="edit-btn" on:click={() => dispatch('edit')}>
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="complete-btn" on:click={handleComplete}>
        <i class="fas fa-check"></i> Complete
      </button>
      <button class="delete-btn" on:click={deleteTodo}>
        <i class="fas fa-trash"></i> Delete
      </button>
    {/if}
  </div>
</div>

<style>
  .details-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h2 {
    font-size: 2rem;
    color: #1e293b;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  h3 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .meta-info {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .created-at {
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
  }

  .description {
    color: #4b5563;
    line-height: 1.8;
    font-size: 1.1rem;
    margin-bottom: 3rem;
  }

  .updates-section {
    margin: 2rem 0;
    padding-top: 1rem;
  }

  .update-form {
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  textarea {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: none;  /* Change this line from 'vertical' to 'none' */
  min-height: 40px;
  background-color: white;
  width: 50%;
}
  textarea:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }

  .update-btn {
    padding: 0.6rem 1.2rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    height: 40px;
    white-space: nowrap;
  }

  .update-btn:hover {
    background: #43a047;
    transform: translateY(-2px);
  }

  .updates-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .update-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
  }

  .update-content {
    color: #1e293b;
    margin-bottom: 1rem;
    line-height: 1.6;
    font-size: 1.1rem;
  }

  .update-date {
    color: #64748b;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .no-updates {
    color: #64748b;
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    background: white;
    border-radius: 12px;
    border: 2px dashed #e2e8f0;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 3rem;
  }

  button {
    padding: 0.75rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease-out;
  }

  button:hover {
    transform: translateY(-2px);
  }

  .completed-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #4CAF50;
    font-weight: 500;
    margin-left: 1rem;
  }

  
  .complete-btn {
    background: #4CAF50;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .completed-date {
    color: #666;
    font-size: 0.9em;
    font-weight: normal;
  }

  .complete-btn:hover {
    background: #45a049;
    transform: translateY(-1px);
  }

  .edit-btn {
    background: #3b82f6;
    color: white;
  }

  .edit-btn:hover {
    background: #2563eb;
  }

  .delete-btn {
    background: #ef4444;
    color: white;
  }

  .delete-btn:hover {
    background: #dc2626;
  }

  @media (max-width: 768px) {
    .details-container {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .update-form {
      margin-bottom: 2rem;
      display: flex;
      gap: 0.75rem;  /* Reduced gap */  /* Reduced gap */
      align-items: flex-start;
    }

    .update-btn {
      width: 50%;
    }

    button {
      padding: 0.75rem 1.0rem;
    }
  }
</style>
