require 'rails_helper'

RSpec.describe TimeSlots::BulkCreateOperation do
  describe '#call' do
    let(:admin) { create(:user, :admin) }
    let(:manager) { create(:user, :manager) }
    let(:first_slot_starts_at) { 2.days.from_now.change(hour: 19, min: 0) }
    let(:second_slot_starts_at) { 3.days.from_now.change(hour: 19, min: 0) }
    let(:time_slots_params) do
      [
        { starts_at: first_slot_starts_at, ends_at: first_slot_starts_at + 90.minutes },
        { starts_at: second_slot_starts_at, ends_at: second_slot_starts_at + 90.minutes },
      ]
    end

    context 'when admin creates multiple slots' do
      subject(:bulk_create) do
        described_class.call(
          params: { time_slots: time_slots_params },
          current_user: admin,
        )
      end

      it 'creates all time slots' do
        expect { bulk_create }.to change(TimeSlot, :count).by(2)
      end

      it 'returns array of created time slots' do
        result = bulk_create
        expect(result).to be_an(Array)
        expect(result.length).to eq(2)
        expect(result).to all(be_a(TimeSlot))
        expect(result).to all(be_persisted)
      end

      it 'sets created_by to current_user' do
        result = bulk_create
        expect(result).to all(have_attributes(created_by: admin))
      end
    end

    context 'when one slot is invalid (atomicity)' do
      subject(:bulk_create) do
        described_class.call(
          params: { time_slots: invalid_params },
          current_user: admin,
        )
      end

      let(:invalid_params) do
        [
          { starts_at: first_slot_starts_at, ends_at: first_slot_starts_at + 90.minutes },
          { starts_at: second_slot_starts_at, ends_at: second_slot_starts_at - 1.hour },
        ]
      end

      it 'raises RecordInvalid' do
        expect { bulk_create }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it 'does not create any slots (rollback)' do
        expect do
          bulk_create
        rescue StandardError
          nil
        end.not_to change(TimeSlot, :count)
      end
    end

    context 'when manager tries to bulk create' do
      subject(:bulk_create) do
        described_class.call(
          params: { time_slots: time_slots_params },
          current_user: manager,
        )
      end

      it 'raises ForbiddenError' do
        expect { bulk_create }.to raise_error(Errors::ForbiddenError)
      end
    end
  end
end
