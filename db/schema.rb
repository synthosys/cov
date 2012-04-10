# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120319202325) do

  create_table "associations", :force => true do |t|
    t.text     "comments"
    t.datetime "lastviewed"
    t.integer  "user_id"
    t.integer  "proposal_id"
  end

  create_table "proposals", :force => true do |t|
    t.text     "reviewerproposals"
    t.text     "nsf_id"
    t.text     "details"
    t.text     "topics"
    t.text     "researchers"
    t.text     "panels"
    t.text     "reviewers"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "division"
  end

  create_table "users", :force => true do |t|
    t.string   "division"
    t.string   "name"
    t.string   "email"
    t.string   "username"
    t.string   "encrypted_password"
    t.string   "role",                   :limit => 10
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count"
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
