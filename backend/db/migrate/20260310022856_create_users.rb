class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_enum :user_role, %w[admin manager]

    create_table :users do |t|
      t.string :email,              null: false
      t.string :encrypted_password, null: false, default: ''
      t.enum   :role,               enum_type: :user_role, null: false, default: 'manager'
      t.string :jti,                null: false

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :jti,   unique: true
  end
end
