require 'rails_helper'

RSpec.describe TimeSlots::UpdateOperation do
  describe '#call' do
    let(:admin) { create(:user, :admin) }
    let(:manager) { create(:user, :manager) }
    let(:time_slot) { create(:time_slot, :available) }
    let(:new_starts_at) { 3.days.from_now.change(hour: 20, min: 0) }
    let(:new_ends_at) { new_starts_at + 90.minutes }

    context 'when admin updates an available slot' do
      subject(:update_slot) do
        described_class.call(
          params: { id: time_slot.id, time_slot_params: { starts_at: new_starts_at, ends_at: new_ends_at } },
          current_user: admin,
        )
      end

      it 'updates the time slot' do
        result = update_slot
        expect(result.starts_at).to eq(new_starts_at)
        expect(result.ends_at).to eq(new_ends_at)
      end

      it 'returns the updated time slot' do
        expect(update_slot).to be_a(TimeSlot)
        expect(update_slot).to be_persisted
      end
    end

    context 'when updating only ends_at (PATCH semantics)' do
      subject(:update_slot) do
        described_class.call(
          params: { id: time_slot.id, time_slot_params: { ends_at: new_ends_at_only } },
          current_user: admin,
        )
      end

      let(:new_ends_at_only) { time_slot.starts_at + 2.hours }

      it 'updates only the provided field' do
        original_starts_at = time_slot.starts_at
        result = update_slot
        expect(result.ends_at).to eq(new_ends_at_only)
        expect(result.starts_at).to eq(original_starts_at)
      end
    end

    context 'when slot is booked' do
      subject(:update_slot) do
        described_class.call(
          params: { id: time_slot.id, time_slot_params: { starts_at: new_starts_at } },
          current_user: admin,
        )
      end

      let(:time_slot) { create(:time_slot, :booked) }

      it 'raises ConflictError' do
        expect { update_slot }.to raise_error(
          Errors::ConflictError, 'Nao e possivel editar um slot que ja esta reservado'
        )
      end
    end

    context 'when slot is cancelled' do
      subject(:update_slot) do
        described_class.call(
          params: { id: time_slot.id, time_slot_params: { starts_at: new_starts_at } },
          current_user: admin,
        )
      end

      let(:time_slot) { create(:time_slot, :cancelled) }

      it 'raises ConflictError' do
        expect { update_slot }.to raise_error(
          Errors::ConflictError, 'Nao e possivel editar um slot que ja esta reservado'
        )
      end
    end

    context 'when manager tries to update' do
      subject(:update_slot) do
        described_class.call(
          params: { id: time_slot.id, time_slot_params: { starts_at: new_starts_at } },
          current_user: manager,
        )
      end

      it 'raises ForbiddenError' do
        expect { update_slot }.to raise_error(Errors::ForbiddenError)
      end
    end

    context 'when slot is not found' do
      subject(:update_slot) do
        described_class.call(
          params: { id: 0, time_slot_params: { starts_at: new_starts_at } },
          current_user: admin,
        )
      end

      it 'raises NotFoundError' do
        expect { update_slot }.to raise_error(Errors::NotFoundError)
      end
    end
  end
end
