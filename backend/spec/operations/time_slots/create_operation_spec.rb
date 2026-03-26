require 'rails_helper'

RSpec.describe TimeSlots::CreateOperation do
  describe '#call' do
    let(:admin) { create(:user, :admin) }
    let(:manager) { create(:user, :manager) }
    let(:starts_at) { 2.days.from_now.change(hour: 19, min: 0) }
    let(:ends_at) { starts_at + 90.minutes }
    let(:params) { { starts_at: starts_at, ends_at: ends_at } }

    context 'when admin creates a slot' do
      subject(:create_slot) { described_class.call(params: params, current_user: admin) }

      it 'creates a time slot' do
        expect { create_slot }.to change(TimeSlot, :count).by(1)
      end

      it 'returns a persisted time slot with correct attributes' do
        result = create_slot
        expect(result).to be_a(TimeSlot)
        expect(result).to be_persisted
        expect(result).to have_attributes(
          starts_at: starts_at,
          ends_at: ends_at,
          status: 'available',
          created_by: admin,
        )
      end

      it 'broadcasts slot_created event' do
        expect(ScrimBroadcastService).to receive(:slot_created).with(an_instance_of(TimeSlot))

        create_slot
      end
    end

    context 'when manager tries to create a slot' do
      subject(:create_slot) { described_class.call(params: params, current_user: manager) }

      it 'raises ForbiddenError' do
        expect { create_slot }.to raise_error(Errors::ForbiddenError)
      end
    end

    context 'when starts_at is duplicated' do
      subject(:create_slot) { described_class.call(params: params, current_user: admin) }

      before { create(:time_slot, starts_at: starts_at, ends_at: ends_at) }

      it 'raises RecordInvalid' do
        expect { create_slot }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'when ends_at is before starts_at' do
      subject(:create_slot) { described_class.call(params: params, current_user: admin) }

      let(:params) { { starts_at: starts_at, ends_at: starts_at - 1.hour } }

      it 'raises RecordInvalid' do
        expect { create_slot }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
