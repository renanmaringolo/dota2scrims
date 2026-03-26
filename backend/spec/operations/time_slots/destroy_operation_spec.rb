require 'rails_helper'

RSpec.describe TimeSlots::DestroyOperation do
  describe '#call' do
    let(:admin) { create(:user, :admin) }
    let(:manager) { create(:user, :manager) }

    context 'when admin destroys an available slot' do
      subject(:destroy_slot) { described_class.call(params: { id: time_slot.id }, current_user: admin) }

      let!(:time_slot) { create(:time_slot, :available) }

      it 'destroys the time slot' do
        expect { destroy_slot }.to change(TimeSlot, :count).by(-1)
      end
    end

    context 'when slot is booked' do
      subject(:destroy_slot) { described_class.call(params: { id: time_slot.id }, current_user: admin) }

      let(:time_slot) { create(:time_slot, :booked) }

      it 'raises ConflictError' do
        expect { destroy_slot }.to raise_error(
          Errors::ConflictError,
          'Nao e possivel deletar um slot que ja esta reservado. Cancele a scrim primeiro.',
        )
      end
    end

    context 'when manager tries to destroy' do
      subject(:destroy_slot) { described_class.call(params: { id: time_slot.id }, current_user: manager) }

      let(:time_slot) { create(:time_slot, :available) }

      it 'raises ForbiddenError' do
        expect { destroy_slot }.to raise_error(Errors::ForbiddenError)
      end
    end

    context 'when slot is not found' do
      subject(:destroy_slot) { described_class.call(params: { id: 0 }, current_user: admin) }

      it 'raises NotFoundError' do
        expect { destroy_slot }.to raise_error(Errors::NotFoundError)
      end
    end
  end
end
