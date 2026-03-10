require 'rails_helper'

RSpec.describe TimeSlot do
  subject(:time_slot) { build(:time_slot) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:starts_at) }
    it { is_expected.to validate_presence_of(:ends_at) }
    it { is_expected.to validate_uniqueness_of(:starts_at) }

    context 'when ends_at is before starts_at' do
      it 'is invalid' do
        slot = build(:time_slot, starts_at: 1.day.from_now, ends_at: 1.day.ago)
        expect(slot).not_to be_valid
        expect(slot.errors[:ends_at]).to include('must be after starts_at')
      end
    end

    context 'when ends_at equals starts_at' do
      it 'is invalid' do
        now = 1.day.from_now
        slot = build(:time_slot, starts_at: now, ends_at: now)
        expect(slot).not_to be_valid
        expect(slot.errors[:ends_at]).to include('must be after starts_at')
      end
    end

    context 'when ends_at is after starts_at' do
      it 'is valid' do
        slot = build(:time_slot)
        expect(slot).to be_valid
      end
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:created_by).class_name('User') }

    it { is_expected.to have_one(:scrim).dependent(:destroy) }
  end

  describe 'enums' do
    it {
      expect(time_slot).to define_enum_for(:status)
        .with_values(available: 'available', booked: 'booked', cancelled: 'cancelled')
        .backed_by_column_of_type(:enum)
    }
  end

  describe 'default values' do
    it 'defaults status to available' do
      expect(described_class.new.status).to eq('available')
    end
  end

  describe 'scopes' do
    describe '.upcoming' do
      it 'returns only future slots ordered by starts_at' do
        travel_to Time.zone.parse('2026-03-15 12:00:00') do
          past_slot   = create(:time_slot, :past)
          future_late = create(:time_slot, starts_at: 3.days.from_now.change(hour: 19),
                                           ends_at: 3.days.from_now.change(hour: 20, min: 30))
          future_soon = create(:time_slot, starts_at: 1.day.from_now.change(hour: 19),
                                           ends_at: 1.day.from_now.change(hour: 20, min: 30))

          result = described_class.upcoming

          expect(result).to eq([future_soon, future_late])
          expect(result).not_to include(past_slot)
        end
      end
    end

    describe '.on_date' do
      it 'returns slots on the given date' do
        travel_to Time.zone.parse('2026-03-15 12:00:00') do
          target_date = Date.parse('2026-03-16')
          on_date_slot = create(:time_slot, starts_at: target_date.in_time_zone.change(hour: 19),
                                            ends_at: target_date.in_time_zone.change(hour: 20, min: 30))
          other_slot   = create(:time_slot, starts_at: (target_date + 1.day).in_time_zone.change(hour: 19),
                                            ends_at: (target_date + 1.day).in_time_zone.change(hour: 20, min: 30))

          result = described_class.on_date(target_date)

          expect(result).to include(on_date_slot)
          expect(result).not_to include(other_slot)
        end
      end
    end

    describe '.between_dates' do
      it 'returns slots within the date range' do
        travel_to Time.zone.parse('2026-03-15 12:00:00') do
          from_date = Date.parse('2026-03-16')
          to_date   = Date.parse('2026-03-18')

          in_range  = create(:time_slot, starts_at: from_date.in_time_zone.change(hour: 19),
                                         ends_at: from_date.in_time_zone.change(hour: 20, min: 30))
          out_range = create(:time_slot, starts_at: (to_date + 2.days).in_time_zone.change(hour: 19),
                                         ends_at: (to_date + 2.days).in_time_zone.change(hour: 20, min: 30))

          result = described_class.between_dates(from_date, to_date)

          expect(result).to include(in_range)
          expect(result).not_to include(out_range)
        end
      end
    end

    describe '.available' do
      it 'returns only available slots' do
        available_slot = create(:time_slot, :available)
        booked_slot    = create(:time_slot, :booked, starts_at: 2.days.from_now.change(hour: 19),
                                                     ends_at: 2.days.from_now.change(hour: 20, min: 30))
        cancelled_slot = create(:time_slot, :cancelled, starts_at: 3.days.from_now.change(hour: 19),
                                                        ends_at: 3.days.from_now.change(hour: 20, min: 30))

        result = described_class.available

        expect(result).to include(available_slot)
        expect(result).not_to include(booked_slot)
        expect(result).not_to include(cancelled_slot)
      end
    end
  end
end
